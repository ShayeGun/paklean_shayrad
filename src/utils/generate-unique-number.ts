function generateUniqueNumber() {
    return String(
        Date.now().toString() + Math.random().toString().replace('0.', '')
    );
}

export { generateUniqueNumber }
