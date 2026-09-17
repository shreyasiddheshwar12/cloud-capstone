resource "azurerm_service_plan" "this" {
  name                = var.service_plan_name
  resource_group_name = var.resource_group_name
  location            = var.location

  os_type  = "Linux"
  sku_name = "B1"
}

resource "azurerm_linux_web_app" "this" {
  name                = var.web_app_name
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.this.id
  https_only          = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on = true

    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    NODE_ENV                              = "production"
    PORT                                  = "8080"
    SQL_SERVER                            = var.sql_server_fqdn
    SQL_DATABASE                          = var.sql_database_name
    SQL_USER                              = var.sql_admin_login
    SQL_PASSWORD                          = var.sql_admin_password
    APPLICATIONINSIGHTS_CONNECTION_STRING = var.app_insights_connection_string
  }
}
