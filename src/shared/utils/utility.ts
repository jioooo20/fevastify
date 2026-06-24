const Utility = {
  mapItems(items: { name: string }[] | undefined): string {
    if (!items || items.length === 0) return "N/A";
    return items.map((i) => i.name).join(", ");
  },

  roundRating(rating: number | undefined): number | undefined {
    if (rating === undefined) {
      return undefined;
    }
    return Math.round(rating * 100) / 100;
  },
};

export default Utility;
