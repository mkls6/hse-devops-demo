resource "yandex_kubernetes_cluster" "k8s" {
  name       = "hse-demo-k8s-cluster"
  network_id = yandex_vpc_network.net.id

  master {
    version = "1.33"

    zonal {
      zone      = "ru-central1-a"
      subnet_id = yandex_vpc_subnet.subnet.id
    }

    public_ip = true
  }

  service_account_id      = yandex_iam_service_account.k8s_sa.id
  node_service_account_id = yandex_iam_service_account.k8s_sa.id
  depends_on = [
    yandex_resourcemanager_folder_iam_member.k8s_sa_admin,
  ]
}
