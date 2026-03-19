resource "yandex_iam_service_account" "k8s_sa" {
  name = "terraform"
}

resource "yandex_resourcemanager_folder_iam_member" "k8s_sa_admin" {
  folder_id = var.folder_id
  role      = "admin"
  member    = "serviceAccount:${yandex_iam_service_account.k8s_sa.id}"
}
