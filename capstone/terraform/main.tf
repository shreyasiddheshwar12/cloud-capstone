data "azurerm_resource_group" "rg" {
  name = var.resource_group_name
}

# SQL Server

resource "azurerm_mssql_server" "sql" {
  name                         = "sqlrecall12"
  resource_group_name          = data.azurerm_resource_group.rg.name
  location                     = data.azurerm_resource_group.rg.location
  version                      = "12.0"

  administrator_login          = "sqladmin"
  administrator_login_password = var.sql_admin_password
}

# SQL Database

resource "azurerm_mssql_database" "recalldb" {
  name      = "recalldb"
  server_id = azurerm_mssql_server.sql.id
  sku_name  = "Basic"
}

# Firewall Rule

resource "azurerm_mssql_firewall_rule" "allowazure" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.sql.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# App Service Plan

resource "azurerm_service_plan" "plan" {
  name                = "asp-recall12"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name

  os_type  = "Linux"
  sku_name = "B1"
}

# Recall API

resource "azurerm_linux_web_app" "recallapi" {
  name                = "recallapi12"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {}
}

# Application Insights

resource "azurerm_application_insights" "insights" {
  name                = "appinsights-recall12"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  application_type    = "web"
}
