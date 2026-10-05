

const rootPath = "https://mysite.itvarsity.org/api/ContactBook/";
const currentPage = window.location.pathname.split("/").pop();
let apiKey = checkApiKey();

function checkApiKey() {
    const storedApiKey = localStorage.getItem("apiKey");

    if (!storedApiKey && currentPage !== "enter-api-key.html") {
        window.location.href = "enter-api-key.html";
    }

    return storedApiKey;
}
