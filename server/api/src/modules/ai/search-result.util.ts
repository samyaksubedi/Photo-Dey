type SearchCompletionMessageInput = {
  matchCount: number;
  galleryLink?: string;
};

export const hasSearchMatches = (matchCount: number) => matchCount > 0;

export const buildSearchCompletionMessage = ({
  matchCount,
  galleryLink,
}: SearchCompletionMessageInput) => {
  if (!hasSearchMatches(matchCount)) {
    return `We couldn't find any matching photos.

Try again with a clear, front-facing selfie in good light.

If the event photos are still being uploaded, try again a little later.`;
  }

  if (!galleryLink) {
    throw new Error('Gallery link is required when search matches exist');
  }

  return `We found ${matchCount} matching photo${matchCount === 1 ? '' : 's'} of you.

Your private gallery:
${galleryLink}`;
};
