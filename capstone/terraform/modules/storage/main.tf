resource "azurerm_storage_container" "recalldocs" {
  name                  = "recalldocs"
  storage_account_id    = var.storage_account_id
  container_access_type = "private"
}
