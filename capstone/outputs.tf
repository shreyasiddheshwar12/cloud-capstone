output "sql_server_name" {
  value = azurerm_mssql_server.sql.name
}

output "database_name" {
  value = azurerm_mssql_database.productdb.name
}

output "product_api_url" {
  value = "https://${azurerm_linux_web_app.productapi.default_hostname}"
}

output "shipment_api_url" {
  value = "https://${azurerm_linux_web_app.shipmentapi.default_hostname}"
}
