const GAS_URL = "https://script.google.com/macros/s/AKfycbx1_EpLviIW221CXfOiEJnlllkPWC407sJbDemxxiBosiFbmFR4agret5_krrJ_4MRu/exec";


// =========================
// 貸出登録
// =========================

let isRenting = false;

document.querySelector(".rent-btn").addEventListener("click", async () => {

  if (isRenting) return;
  isRenting = true;

  const rentBtn = document.querySelector(".rent-btn");

  const requiredItems = document.querySelectorAll("[required]");

  for (let item of requiredItems) {
    if (!item.value.trim()) {
      alert("必須項目をすべて入力してください");
      item.focus();
      isRenting = false;
      return;
    }
  }

  const telInput = document.querySelector('input[type="tel"]');
  const tel = telInput.value.trim();

  if (!/^\d{11}$/.test(tel)) {
    alert("電話番号はハイフンなし11桁で入力してください");
    telInput.focus();
    isRenting = false;
    return;
  }

  const checks = document.querySelectorAll(".check input[type='checkbox']");

  for (let check of checks) {
    if (!check.checked) {
      alert("確認事項すべてにチェックしてください");
      isRenting = false;
      return;
    }
  }

  rentBtn.disabled = true;
  rentBtn.textContent = "登録中...";

  const data = {
    mode: "rent",
    car: document.getElementById("rentalCar").value,
    name: document.querySelectorAll('input[type="text"]')[0].value,
    tel: tel,
    reason: document.querySelectorAll("select")[1].value,
    start: document.querySelectorAll('input[type="datetime-local"]')[0].value,
    end: document.querySelectorAll('input[type="datetime-local"]')[1].value,
    staff: document.querySelectorAll("select")[2].value,
    sign: document.querySelectorAll('input[type="text"]')[1].value
  };

  try {

    await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });

    alert("貸出確認を登録しました");
    location.reload();

  } catch (error) {

    alert("送信エラー");

    isRenting = false;
    rentBtn.disabled = false;
    rentBtn.textContent = "貸出確認完了";
  }

});


// =========================
// 返却処理
// =========================

let isReturning = false;

document.querySelector(".return-btn").addEventListener("click", async () => {

  if (isReturning) return;
  isReturning = true;

  const returnBtn = document.querySelector(".return-btn");

  const returnCar = document.getElementById("returnCar").value;

  if (!returnCar) {
    alert("返却する代車を選択してください");
    isReturning = false;
    return;
  }

  returnBtn.disabled = true;
  returnBtn.textContent = "返却中...";

  const data = {
    mode: "return",
    car: returnCar
  };

  try {

    await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });

    alert("返却済みにしました");
    location.reload();

  } catch (error) {

    alert("返却処理でエラーが出ました");

    isReturning = false;
    returnBtn.disabled = false;
    returnBtn.textContent = "返却完了";
  }

});


// =========================
// 貸出中の代車を選べなくする
// =========================

async function loadRentalCars() {

  const res = await fetch(GAS_URL);
  const rentalCars = await res.json();

  const rentalSelect = document.getElementById("rentalCar");

  Array.from(rentalSelect.options).forEach(option => {

    const carName = option.textContent.trim();

    if (rentalCars.includes(carName)) {

      option.disabled = true;
      option.textContent = "🚫 貸出中：" + carName;

    }

  });
}

loadRentalCars();