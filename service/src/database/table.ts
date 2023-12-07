/**
 * The isolated schema name allocated to this service.
 * This is issued by the supervisor stack.
 */
export const schema = 'rg_service_map';

/**
 * A enum of all tables provided by the service.
 */
export const enum TableName {
  LandRegistryTitle = 'land_registry_title',
}
