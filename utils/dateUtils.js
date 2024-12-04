function getUtc3Date() {
    const date = new Date();
    return new Date(date.getTime() + 3 * 60 * 60 * 1000);
}
function formatDateToYMDHIS(isoDate) {
    const date = new Date(isoDate);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
module.exports = {
    getUtc3Date,
    formatDateToYMDHIS
};