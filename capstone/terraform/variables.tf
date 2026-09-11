variable "subscription_id" {
  type = string
}

variable "resource_group_name" {
  type    = string
  default = "cloud-capstone"
}

variable "sql_server_name" {
  type    = string
  default = "sqlpharma12"
}

variable "database_name" {
  type    = string
  default = "recalldb"
}

variable "sql_admin_login" {
  type    = string
  default = "sqladmin"
}

variable "sql_admin_password" {
  type      = string
  sensitive = true
}

variable "service_plan_name" {
  type    = string
  default = "asp-pharma12"
}

variable "recall_api_name" {
  type    = string
  default = "recallapi-pharma12"
}

variable "application_insights_name" {
  type    = string
  default = "appinsights-pharma12"
}
