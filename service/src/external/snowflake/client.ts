import type { ConfigureOptions, Connection, ConnectionOptions } from 'snowflake-sdk';
import { configure, createConnection } from 'snowflake-sdk';

/* eslint-disable no-console */

/**
 * @see https://community.snowflake.com/s/article/How-to-turn-off-OCSP-checking-in-Snowflake-client-drivers
 */
export class SnowflakeClient {
  private readonly options: ConnectionOptions & ConfigureOptions;
  private connection: Connection | undefined;

  public constructor(options: ConnectionOptions) {
    this.options = {
      ...options,

      insecureConnect: true,
    };

    configure({
      insecureConnect: true,
    });
  }

  public async connect(): Promise<void> {
    if (this.connection !== undefined) {
      return Promise.reject('[snowflake] connection missing');
    }

    this.connection = createConnection(this.options);

    return new Promise((resolve, reject) => {
      this.connection?.connect((error) => {
        if (error !== undefined && error !== null) {
          console.error('[snowflake] connect', 'error', error);

          reject(error);

          return;
        }

        resolve();
      });
    });
  }

  public async execute<T>(name: string, sql: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.connection?.execute({
        sqlText: sql,

        complete: (error, statement, rows) => {
          if (error !== undefined && error !== null) {
            console.info('[snowflake] execute', 'error', name, {
              statement: {
                rid: statement.getRequestId(),
                sid: statement.getStatementId(),
                status: statement.getStatus(),
              },
            });

            console.error('[snowflake] execute', 'error', error);

            reject(error);

            return;
          }

          resolve(rows ?? []);
        },
      });
    });
  }

  public async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection?.destroy((error) => {
        if (error !== undefined && error !== null) {
          console.error('[snowflake] disconnect', 'error', error);

          reject(error);

          return;
        }

        this.connection = undefined;

        resolve();
      });
    });
  }
}
