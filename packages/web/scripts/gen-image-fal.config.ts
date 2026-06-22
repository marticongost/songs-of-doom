export default {
	apiKey: process.env.FAL_KEY ?? '',
	model: 'fal-ai/bytedance/seedream/v4.5/text-to-image',
	imageSize: 'landscape_16_9',
	systemPrompt: `
	You are an illustrator for Songs of Doom, a dark fantasy card game with a gothic
	medieval aesthetic. Generate a single card illustration suitable for printing. The art
	style is illustration, hand drawn, european comic, detailed, and atmospheric. The
	image should fill the entire canvas with no borders, frames, or text. Focus on the
	central subject with a dynamic composition appropriate for a collectible card game.

	No christian symbols or iconography from any real world religion. No cleavage or
	sexualized imagery.
	`
};
