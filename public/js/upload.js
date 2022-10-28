document.getElementById("imageUpload").onclick = function () {
  let xhttp = new XMLHttpRequest(); // create new AJAX request

  const selectedImage = document.getElementById("selectedImage");
  const imageStatus = document.getElementById("imageStatus");
  const progressBar = document.getElementById("progressBar");
  const progressDiv = document.getElementById("progressDiv");
  const uploadResult = document.getElementById("uploadResult");

  xhttp.responseType = "json";
  xhttp.onreadystatechange = function () {
    if (xhttp.status == 200) {
      imageStatus.innerHTML = this.response.message;
      uploadResult.innerHTML = this.response.address;
      selectedImage.value = "";
    } else {
      imageStatus.innerHTML = this.response.error;
      uploadResult.innerHTML = this.response.address;
      selectedImage.value = "";
    }
  };

  xhttp.open("POST", "/dashboard/image-upload");
  xhttp.upload.onprogress = function (event) {
    if (event.lengthComputable) {
      let result = Math.floor((event.loaded / event.total) * 100);
      progressBar.innerHTML = result + "%";
      progressBar.style.width = result + "%";
      progressBar.setAttribute("aria-valuenow", result);
      if (result == 100) {
        setTimeout(() => {
          progressDiv.style.display = "none";
          progressBar.innerHTML = "0%";
          progressBar.style.width = "0%";
          progressBar.setAttribute("aria-valuenow", 0);
        }, 1000);
      }
    }
  };

  let formData = new FormData();
  if (selectedImage.files.length > 0) {
    formData.append("image", selectedImage.files[0]);
    xhttp.send(formData);
    progressDiv.style.display = "block";
  } else {
    imageStatus.innerHTML = "ابتدا عکس خود را انتخاب کنید";
  }
};
