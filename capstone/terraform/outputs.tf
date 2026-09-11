output "sql_server_name" {
  value = azurerm_mssql_server.sql.name
}

output "database_name" {
  value = azurerm_mssql_database.recalldb.name
}

output "recall_api_url" {
  value = azurerm_linux_web_app.recallapi.default_hostname
}

output "application_insights" {
  value = azurerm_application_insights.insights.name
}
