resource "azurerm_logic_app_workflow" "recall_notification" {

  name = var.logic_app_name

  location = var.location

  resource_group_name = var.resource_group_name

  enabled = true

  tags = {
    Project = "CloudCapstone"
  }
}