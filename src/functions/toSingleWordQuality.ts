function toSingleWordQuality(qualitySentence: string): string {
    const lower = qualitySentence.toLowerCase();
    const singleWords = [
        'animals',
        'power',
        'horny',
        'kids',
        'multitasking',
        'gardening',
        'creative',
        'funny',
        'optimistic',
        'surprises',
    ];
    for (let quality of singleWords) {
        if (lower.indexOf(quality) > -1) {
            return quality;
        }
    }
    return 'NULL';
}

export default toSingleWordQuality;
