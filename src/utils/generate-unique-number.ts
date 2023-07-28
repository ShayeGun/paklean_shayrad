function generateUniqueNumber() {
    const num = String(
        Date.now().toString() + Math.random().toString().replace('0.', '')
    );
    // check number in console
    console.log('<> ', num, ' <>');
    return num
}

export { generateUniqueNumber }
