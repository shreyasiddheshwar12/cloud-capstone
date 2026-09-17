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

output "eventgrid_topic_endpoint" {
  value = module.eventgrid.topic_endpoint
}

output "eventgrid_topic_id" {
  value = module.eventgrid.topic_id
}

output "logic_app_name" {
  value = module.logicapp.logic_app_name
}

output "logic_app_id" {
  value = module.logicapp.logic_app_id
}

output "logic_app_endpoint" {
  value = module.logicapp.logic_app_access_endpoint
}