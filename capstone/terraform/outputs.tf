output "recall_api_url" {
  value = "https://${module.recall_api.default_hostname}"
}

output "sql_server_name" {
  value = module.sql.server_name
}

output "sql_database_name" {
  value = module.sql.database_name
}

output "app_service_principal_id" {
  value = module.recall_api.principal_id
}
``
