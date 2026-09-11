resource "azurerm_service_plan" "plan" {
  name                = var.plan_name
  resource_group_name = var.resource_group_name
  location            = var.location

  os_type  = "Linux"
  sku_name = "B1"
}

resource "azurerm_linux_web_app" "app" {
  name                = var.app_name
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {
    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    WEBSITE_NODE_DEFAULT_VERSION = "~20"
  }
}
