// Pastikan SweetAlert2 sudah dimuat di HTML sebelum file ini
// (Misal: <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script> di <head>)

// Fungsi untuk menambahkan produk ke keranjang
function addToCart(nama, harga, jumlah = 1) {
    const parsedHarga = parseFloat(harga);

    if (isNaN(parsedHarga)) {
        console.error("Harga tidak valid:", harga);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Harga produk tidak valid. Item tidak dapat ditambahkan.',
            confirmButtonText: 'OK'
        });
        return;
    }

    console.log("LANGKAH 1: Fungsi addToCart dipanggil untuk:", nama, "dengan harga (sudah angka):", parsedHarga);

    // Menggunakan sessionStorage
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex(item => item.nama === nama);

    let iconType = 'success';
    let titleText = 'Berhasil!';
    let messageText = `${nama} telah ditambahkan ke keranjang Anda.`;

    if (existingIndex >= 0) {
        cart[existingIndex].jumlah += jumlah;
    } else {
        cart.push({ nama: nama, harga: parsedHarga, jumlah: jumlah });
    }

    // Simpan kembali keranjang yang sudah diupdate ke sessionStorage
    sessionStorage.setItem("cart", JSON.stringify(cart));
    console.log("LANGKAH 2: Keranjang setelah penambahan (dari sessionStorage):", JSON.parse(sessionStorage.getItem("cart")));

    Swal.fire({
        icon: iconType,
        title: titleText,
        text: messageText,
        confirmButtonText: 'OK'
    });
}

// Fungsi untuk menampilkan modal detail produk
function showProductModal(nama, harga, kategori, gambar, deskripsi) {
    const productModalElement = document.getElementById('productModal');
    if (!productModalElement) {
        console.error("Elemen modal dengan ID 'productModal' tidak ditemukan.");
        return;
    }
    const productModal = new bootstrap.Modal(productModalElement);

    document.getElementById('modalProductImage').src = gambar;
    document.getElementById('modalProductName').innerText = nama;
    document.getElementById('modalProductCategory').innerText = kategori;
    document.getElementById('modalProductPrice').innerText = `$${harga}`;
    document.getElementById('modalProductDescription').innerText = deskripsi;

    const modalAddToCartBtn = document.getElementById('modalAddToCartButton');
    if (modalAddToCartBtn) {
        modalAddToCartBtn.onclick = function () {
            addToCart(nama, harga);
            productModal.hide();
        };
    }

    productModal.show();
}

// Fungsi untuk menangani klik pada gambar/kartu produk untuk membuka modal
function handleProductModalClick(event, nama, harga, kategori, gambar, deskripsi) {
    event.preventDefault();
    showProductModal(nama, harga, kategori, gambar, deskripsi);
}

// Fungsi untuk menangani klik pada tombol 'Add to Cart' langsung di daftar produk (tanpa modal)
function handleAddToCartClick(event, nama, harga) {
  event.preventDefault();
  event.stopPropagation(); // 🔥 Ini mencegah modal ikut terbuka
  addToCart(nama, harga);
}


// --- Fungsi Khusus untuk Halaman Keranjang (cart.html) ---

function loadCart() {
    const tbody = document.getElementById('cartTableBody');
    const totalLabel = document.getElementById('totalBelanja');
    if (!tbody || !totalLabel) {
        // Jika elemen tidak ditemukan (misal, tidak di halaman cart.html), jangan lanjutkan
        return;
    }

    // Menggunakan sessionStorage
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    tbody.innerHTML = ''; // Kosongkan tabel sebelumnya
    let totalKeseluruhan = 0;

    if (cart.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">Keranjang belanja Anda kosong.</td></tr>`;
    } else {
        cart.forEach((item, index) => {
            const row = document.createElement('tr');
            const subtotal = item.harga * item.jumlah;
            totalKeseluruhan += subtotal;
            row.innerHTML = `
                <td>${item.nama}</td>
                <td>$${item.harga.toFixed(2)}</td>
                <td>${item.jumlah}</td>
                <td>$${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="hapusItem(${index})">Hapus</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    totalLabel.textContent = `Total: $${totalKeseluruhan.toFixed(2)}`;
}

function hapusItem(index) {
    // Menggunakan sessionStorage
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    sessionStorage.setItem("cart", JSON.stringify(cart)); // Simpan kembali
    loadCart(); // Muat ulang tabel
}

function kosongkanKeranjang() {
    Swal.fire({
        title: 'Yakin ingin mengosongkan keranjang?',
        text: "Semua item akan dihapus.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#aaa',
        confirmButtonText: 'Ya, kosongkan!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Menghapus dari sessionStorage
            sessionStorage.removeItem("cart");
            loadCart(); // Muat ulang tabel (akan menjadi kosong)
            Swal.fire('Dikosongkan!', 'Keranjang berhasil dikosongkan.', 'success');
        }
    });
}

// Panggil loadCart saat DOM dimuat untuk halaman yang membutuhkannya (misalnya cart.html)
// Ini harus berada di bagian bawah file agar semua fungsi sudah terdefinisi.
document.addEventListener("DOMContentLoaded", loadCart);