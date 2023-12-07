import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.context import SparkContext
from py4j.java_gateway import java_import
from pyspark.sql.functions import col
import psycopg2
import psycopg2.extras
from psycopg2 import OperationalError
from psycopg2.extensions import AsIs

def is_null(c):
  return col(c).isNull()

def print_postgres_exception(err):
    err_type, err_value, traceback = sys.exc_info()
    print ("\npsycopg2 ERROR:", err)
    print ("psycopg2 traceback:", traceback, "-- type:", err_type, "-- value:", err_value)
    print ("pgcode:", err.pgcode, "\n")

SNOWFLAKE_SOURCE_NAME = "net.snowflake.spark.snowflake"
args = getResolvedOptions(sys.argv, [
    'JOB_NAME',
    'SYNC_TYPE',
    'SNOWFLAKE_URL',
    'SNOWFLAKE_ACCOUNT',
    'SNOWFLAKE_WAREHOUSE',
    'SNOWFLAKE_DB',
    'SNOWFLAKE_SCHEMA',
    'SNOWFLAKE_TABLE',
    'SNOWFLAKE_USER',
    'SNOWFLAKE_PASSWORD',
    'SNOWFLAKE_ROLE',
    'AURORA_HOST',
    'AURORA_PORT',
    'AURORA_DB',
    'AURORA_SCHEMA',
    'AURORA_TABLE',
    'AURORA_USER',
    'AURORA_PASSWORD'
])

syncType = args['SYNC_TYPE']

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

java_import(spark._jvm, SNOWFLAKE_SOURCE_NAME)
uj = sc._jvm.net.snowflake.spark.snowflake
spark._jvm.net.snowflake.spark.snowflake.SnowflakeConnectorUtils.enablePushdownSession(spark._jvm.org.apache.spark.sql.SparkSession.builder().getOrCreate())

sfOptions = {
"sfUrl" : args['SNOWFLAKE_URL'],
"sfUser" : args['SNOWFLAKE_USER'],
"sfAccount": args['SNOWFLAKE_ACCOUNT'],
"sfPassword" : args['SNOWFLAKE_PASSWORD'],
"sfDatabase" : args['SNOWFLAKE_DB'],
"sfSchema" : args['SNOWFLAKE_SCHEMA'],
"sfWarehouse" : args['SNOWFLAKE_WAREHOUSE'],
"sfRole": args['SNOWFLAKE_ROLE'],
"application" : "AWSGlue"
}

df = spark.read.format(SNOWFLAKE_SOURCE_NAME).options(**sfOptions).option("dbtable", args['SNOWFLAKE_TABLE']).option("autopushdown", "off").load()

# Data frame filters

df = df.filter(col("CLASS_OF_TITLE") == "AF")
df = df.drop("CLASS_OF_TITLE")

# Data frame transformations

df = df.withColumnRenamed("ID", "id")
df = df.withColumnRenamed("TITLE_NUMBER", "title_number")
df = df.withColumnRenamed("POLYGON", "polygon")
df = df.withColumnRenamed("CENTROID", "centroid")
df = df.withColumnRenamed("UPDATED_AT", "updated_at")

try:
    connection = psycopg2.connect(
        host=args['AURORA_HOST'],
        port=args['AURORA_PORT'],
        database=args['AURORA_DB'],
        user=args['AURORA_USER'],
        password=args['AURORA_PASSWORD']
    )
except OperationalError as err:
    print_postgres_exception(err)
    connection = None

if connection != None:
    cursor = connection.cursor()

    if syncType == "full":

        # Insert all records
        for row in df.collect():
            id = row["id"]
            title_number = row["title_number"]
            polygon = row["polygon"]
            centroid = row["centroid"]
            updated_at = row["updated_at"]
            try:
                cursor.execute("INSERT INTO %s.%s VALUES (%s, %s, (%s)::polygon, (%s)::point, %s)", (AsIs(args['AURORA_SCHEMA']), AsIs(args['AURORA_TABLE']), id, title_number, polygon, centroid, '2016-06-22 19:10:25-07'))
                connection.commit()
            except Exception as err:
                print_postgres_exception(err)
                connection.rollback()

    elif syncType == "updates":

        # Upsert new or modified records
        df_changes = df.filter(~is_null("updated_at"))
        for row in df_changes.collect():
            id = row["id"]
            title_number = row["title_number"]
            polygon = row["polygon"]
            centroid = row["centroid"]
            updated_at = row["updated_at"]
            try:
                cursor.execute("INSERT INTO %s.%s VALUES (%s, %s, (%s)::polygon, (%s)::point, %s) ON CONFLICT (id) DO UPDATE SET title_number = %s, polygon = (%s)::polygon, centroid = (%s)::point, updated_at = %s", (AsIs(args['AURORA_SCHEMA']), AsIs(args['AURORA_TABLE']), id, title_number, polygon, centroid, updated_at, title_number, polygon, centroid, updated_at))
                connection.commit()
            except Exception as err:
                print_postgres_exception(err)
                connection.rollback()

        # Delete records
        df = df.withColumnRenamed("DELETED_AT", "deleted_at")
        df_deletions = df.filter(~is_null("deleted_at"))
        for row in df_deletions.collect():
            id = row["id"]
            try:
                cursor.execute("DELETE FROM %s.%s WHERE id = " + '%s::varchar', (AsIs(args['AURORA_SCHEMA']), AsIs(args['AURORA_TABLE']), id))
                connection.commit()
            except Exception as err:
                print_postgres_exception(err)
                connection.rollback()

cursor.close()
connection.close()
