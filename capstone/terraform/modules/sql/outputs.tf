output "server_name" {
  value = azurerm_mssql_server.sql.name
}

output "db_name" {
  value = azurerm_mssql_database.db.name
}

output "server_id" {
  value = azurerm_mssql_server.sql.id
}
