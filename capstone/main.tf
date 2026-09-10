data "azurerm_resource_group" "rg" {
  name = var.resource_group_name
}

resource "azurerm_mssql_server" "sql" {
  name                         = "sqlpharma12"
  resource_group_name          = data.azurerm_resource_group.rg.name
  location                     = data.azurerm_resource_group.rg.location
  version                      = "12.0"

  administrator_login          = "sqladmin"
  administrator_login_password = var.sql_admin_password
}

resource "azurerm_mssql_firewall_rule" "allow_azure" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.sql.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

resource "azurerm_mssql_database" "productdb" {
  name      = "productdb"
  server_id = azurerm_mssql_server.sql.id
  sku_name  = "Basic"
}

resource "azurerm_service_plan" "plan" {
  name                = "asp-pharma12"
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location

  os_type  = "Linux"
  sku_name = "B1"
}

resource "azurerm_linux_web_app" "productapi" {
  name                = "productapi-pharma12"
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {}
}

resource "azurerm_linux_web_app" "shipmentapi" {
  name                = "shipmentapi-pharma12"
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {}
}

resource "azurerm_application_insights" "appinsights" {
  name                = "appinsights-pharma12"
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
  application_type    = "web"
}
