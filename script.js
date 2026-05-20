const GAS_URL = "https://script.google.com/macros/s/AKfycbx1_EpLviIW221CXfOiEJnlllkPWC407sJbDemxxiBosiFbmFR4agret5_krrJ_4MRu/exec";

document.querySelector(".rent-btn").addEventListener("click", async () => {

  const requiredItems = document.querySelectorAll("[required]");

  for (let item of requiredItems) {
    if (!item.value.trim()) {
      alert("必須項目をすべて入力してください");
      item.focus();
      return;
    }
  }

  const telInput = document.querySelector('input[type="tel"]');
  const tel = telInput.value.trim();

  if (!/^\d{11}$/.test(tel)) {
    alert("電話番号はハイフンなし11桁で入力してください");
    telInput.focus();
    return;
  }

  const checks = document.querySelectorAll(".check input[type='checkbox']");

  for (let check of checks) {
    if (!check.checked) {
      alert("確認事項すべてにチェックしてください");
      return;
    }
  }

  const data = {
    car: document.querySelector("select").value,
    name: document.querySelector('input[type="text"]').value,
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

  } catch (error) {

    alert("送信エラー");

  }

});
document.querySelector(".return-btn").addEventListener("click", async () => {

  const returnCar = document.getElementById("returnCar").value;

  if (!returnCar) {
    alert("返却する代車を選択してください");
    return;
  }

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

  } catch (error) {

    alert("返却処理でエラーが出ました");

  }

});