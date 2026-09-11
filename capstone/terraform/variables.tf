variable "resource_group_name" {
  default = "cloud-capstone"
}

variable "location" {
  default = "centralindia"
}

variable "sql_admin_password" {
  type      = string
  sensitive = true
}


variable "environment" {}

variable "resource_group_name" {}

variable "location" {}

variable "sql_server_name" {}

variable "sql_database_name" {}

variable "app_service_plan" {}

variable "recall_api_name" {}

variable "appinsights_name" {}

variable "storage_account_name" {}

variable "sql_admin_password" {
  sensitive = true
}
