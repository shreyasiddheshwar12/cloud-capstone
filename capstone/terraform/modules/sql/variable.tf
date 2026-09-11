variable "server_name" {}
variable "db_name" {}
variable "resource_group_name" {}
variable "location" {}
variable "admin_login" {}

variable "admin_password" {
  sensitive = true
}
