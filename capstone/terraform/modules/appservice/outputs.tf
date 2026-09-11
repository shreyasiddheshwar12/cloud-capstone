output "app_url" {
  value = "https://${azurerm_linux_web_app.app.default_hostname}"
}

output "plan_id" {
  value = azurerm_service_plan.plan.id
}

output "app_id" {
  value = azurerm_linux_web_app.app.id
}
