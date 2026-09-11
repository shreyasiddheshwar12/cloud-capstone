data "azurerm_resource_group" "rg" {
  name = var.resource_group_name
}

module "sql" {
  source = "./modules/sql"

  server_name         = var.sql_server_name
  database_name       = var.database_name
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
  admin_login         = var.sql_admin_login
  admin_password      = var.sql_admin_password
}

module "monitoring" {
  source = "./modules/monitoring"

  workspace_name            = "log-pharma12"
  application_insights_name = var.application_insights_name
  resource_group_name       = data.azurerm_resource_group.rg.name
  location                  = data.azurerm_resource_group.rg.location
}

module "recall_api" {
  source = "./modules/app-service"

  service_plan_name              = var.service_plan_name
  web_app_name                   = var.recall_api_name
  resource_group_name            = data.azurerm_resource_group.rg.name
  location                       = data.azurerm_resource_group.rg.location
  sql_server_fqdn                = module.sql.server_fqdn
  sql_database_name              = module.sql.database_name
  sql_admin_login                = var.sql_admin_login
  sql_admin_password             = var.sql_admin_password
  app_insights_connection_string = module.monitoring.connection_string
}
