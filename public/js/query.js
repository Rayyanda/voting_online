function togglepassword(){
    var passwordInput = document.getElementById("passwordCreator");
    var spass = document.getElementById("eye");
    if(passwordInput.type === "password"){
        passwordInput.type = "text";
        spass.src = "/image/eye-slash.svg";
    }else{
        passwordInput.type = "password";
        spass.src = "/image/eye.svg";
    }
}
function startVote(){
    var form = document.getElementById("kodeVote");

    form.action = `/peserta`;
    form.method = "post";
    form.submit();
}

function addParticipants(){
    var form = document.getElementById("addParticipants");
    var kode_peserta = document.getElementById("kode_peserta");
    var nama_peserta = document.getElementById("nama_peserta");

    form.action = "/add-participants-by-user";
    form.method = "post";
    form.submit();
    
}

function addCandidate(){
    var form = document.getElementById("addCandidate");
    var kode_peserta = document.getElementById("kode_kandidat");
    var nama_peserta = document.getElementById("nama_kandidat");

    form.action = "/add-candidate";
    form.method = "post";
    form.submit();
    
}

function enable(){
    document.getElementById("kodevoting").disabled = false;
}
function disabled(){
    document.getElementById("kodevoting").disabled = true;
}
function acakkode(){
    var kodeacak = document.getElementById("kodeUnik");
    const randomCode = Math.random().toString(36).substring(3, 8);
    kodeacak.value = randomCode;
}
setInterval(()=>{
    const time_element = document.getElementById("time");
    time_element.innerText = new Date().toLocaleTimeString();
},1000);
// Misalnya, ketika button diklik
document.getElementById('myButton').addEventListener('click', function() {
  // Mengubah tampilan button menjadi mode loading
  this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Loading...';

  // Lakukan tugas yang membutuhkan waktu, misalnya panggil API atau proses data
  // Setelah tugas selesai, Anda dapat mengubah kembali tampilan button seperti semula
});
// Tangkap elemen modal-body dan modal-footer
function modal_stop_vote(){
    $('#modalBody').html('<h2 class="fs-5">Apakah Anda ingin menyelesaikan Vote?</h2>');
    $('#modalFooter').html('<button type="button"  class="btn btn-secondary" data-bs-dismiss="modal">Batal</button><a href="/stop-vote" class="btn btn-primary">Selesai</a>');

}
function modal_open_vote(){
    $('#modalBody').html('<h2 class="fs-5">Apakah Anda ingin memulai Vote?</h2>');
    $('#modalFooter').html(`<button type="button"  class="btn btn-secondary" data-bs-dismiss="modal">Batal</button><a href="/open-vote" class="btn btn-primary">Mulai</a>`);
}
function modal_cant_open_vote(){
    $('#modalBody').html('<h2 class="fs-5">Vote telah dimulai atau sudah ditutup</h2>');
    $('#modalFooter').html(`<button type="button"  class="btn btn-primary" data-bs-dismiss="modal">Batal</button>`);

}

function modal_add_peserta(){
    var kode_vote = $('#kode_vote').text();
    $('#modalBody').html(`<form method="post" id="addParticipants"><div class="mb-3"><label for="kode_peserta" class="col-form-label">Kode Peserta :</label><input type="text" class="form-control" id="kode_peserta" name="kodePeserta" placeholder="6 karakter bebas"></div><div class="mb-3"><label for="nama_peserta" class="col-form-label">Nama Peserta :</label><input class="form-control" type="text" id="nama_peserta" name="namaPeserta"></div></form>`);
    $('#modalFooter').html(`<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>\n<button type="submit" class="btn btn-success" onclick="addParticipants()">Tambah</button>`);

}
function modal_del_vote(kode_vote){
    $('#modalBody').html('<h2 class="fs-5">Apakah Anda ingin menghapus Vote?</h2><br><p>Anda akan menghapus semua data peserta dan voting.</p>');
    $('#modalFooter').html(`<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>\n<a href="/del-vote/${kode_vote}" class="btn btn-danger">Hapus</a>`);

}

function modal_del_kandidat(kode){
    $('#modalBody').html(`<h2 class="fs-5">Apakah Anda ingin menghapus Kandidat ini?</h2><p>Kandidat ${kode} ini tidak akan dapat untuk mengikuti vote. Dan harus Input ulang jika ingin mengikuti vote</p>`);
    $('#modalFooter').html(`<button type="button"  class="btn btn-secondary" data-bs-dismiss="modal">Batal</button><a href="/delete-kandidat/${kode}" class="btn btn-danger">Hapus</a>`);

}
function modal_del_peserta(nama, kode){
    $('#modalBody').html(`<h2 class="fs-5">Apakah Anda ingin menghapus Peserta ini?</h2><p>${nama} ${kode}tidak akan dapat untuk mengikuti vote. Dan harus mendaftar ulang jika ingin mengikuti vote</p>`);
    $('#modalFooter').html(`<button type="button"  class="btn btn-secondary" data-bs-dismiss="modal">Batal</button><a href="/delete/${kode}" class="btn btn-danger">Hapus</a>`);
}

function modal_add_kandidat(){
    var kode_vote = $('#kode_vote').text();
    $('#modalBody').html(`<form method="post" id="addCandidate" enctype="multipart/form-data"><div class="mb-3"><label for="kode_kandidat" class="col-form-label">Kode Kandidat :</label><input type="text" class="form-control" id="kode_kandidat" name="kodeKandidat"></div><div class="mb-3"><label for="nama_kandidat" class="col-form-label">Nama Peserta :</label><input class="form-control" type="text" id="nama_kandidat" name="namaKandidat"></div><div class="mb-3"><label for="foto_kandidat"class="col-form-label">Foto Kandidat : </label><input type="file" name="fotoKandidat" id="fotoKandidat"></div></form>`);
    $('#modalFooter').html(`<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>\n<button type="submit" class="btn btn-success" onclick="addCandidate()">Tambah</button>`);
}
function modal_calc_vote(kode_vote){
    $('#modalBody').html('<h2 class="fs-5">Apakah Anda ingin melihat hasil vote?</h2>');
    $('#modalFooter').html(`<button type="button"  class="btn btn-secondary" data-bs-dismiss="modal">Batal</button><a href="/result/${kode_vote}" class="btn btn-primary">Lihat</a>`);
}