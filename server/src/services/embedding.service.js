import { l2Normalize } from '../utils/math.js';
import crypto from 'crypto';

const MODEL_ID = 'Xenova/clip-vit-base-patch32';

let tokenizer = null;
let processor = null;
let textModel = null;
let visionModel = null;
let RawImageClass = null;
let isInitializing = false;
let initPromise = null;
let loadFailed = false;

/**
 * Initializes and warms up the CLIP models (Singleton)
 */
export const initializeCLIP = async () => {
  if (tokenizer && processor && textModel && visionModel) {
    return { tokenizer, processor, textModel, visionModel, RawImage: RawImageClass };
  }

  if (isInitializing) {
    return initPromise;
  }

  isInitializing = true;
  initPromise = (async () => {
    try {
      console.log(`[CLIP] Loading model ${MODEL_ID}...`);
      const {
        AutoTokenizer,
        AutoProcessor,
        CLIPTextModelWithProjection,
        CLIPVisionModelWithProjection,
        RawImage
      } = await import('@xenova/transformers');

      RawImageClass = RawImage;
      tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID);
      processor = await AutoProcessor.from_pretrained(MODEL_ID);
      textModel = await CLIPTextModelWithProjection.from_pretrained(MODEL_ID);
      visionModel = await CLIPVisionModelWithProjection.from_pretrained(MODEL_ID);

      console.log(`[CLIP] Successfully loaded and warmed up ${MODEL_ID}`);
      loadFailed = false;
      return { tokenizer, processor, textModel, visionModel, RawImage: RawImageClass };
    } catch (err) {
      console.warn(`[CLIP] Failed to load transformer weights: ${err.message}. Enabling deterministic embedding fallback.`);
      loadFailed = true;
      return null;
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
};

/**
 * Deterministic pseudo-embedding for fallback/offline/testing mode (512 dimensions)
 */
const generateFallbackEmbedding = (seedString) => {
  const hash = crypto.createHash('sha256').update(seedString).digest();
  const vector = new Array(512);
  for (let i = 0; i < 512; i++) {
    const byte = hash[i % hash.length];
    // Scale to pseudo-normal distribution around zero
    vector[i] = ((byte + (i * 13)) % 256) / 128.0 - 1.0;
  }
  return l2Normalize(vector);
};

/**
 * Embeds an image (buffer, url, or path) into a 512-dim vector
 */
export const embedImage = async (imageInput) => {
  try {
    const models = await initializeCLIP();
    if (!models || loadFailed) {
      const seed = typeof imageInput === 'string' ? imageInput : 'image-buffer';
      return generateFallbackEmbedding(`image:${seed}`);
    }

    let image;
    if (Buffer.isBuffer(imageInput)) {
      const blob = new Blob([imageInput]);
      image = await models.RawImage.fromBlob(blob);
    } else {
      image = await models.RawImage.read(imageInput);
    }

    const imageInputs = await models.processor(image);
    const { image_embeds } = await models.visionModel(imageInputs);
    return l2Normalize(Array.from(image_embeds.data));
  } catch (err) {
    console.error(`[CLIP] Error embedding image: ${err.message}`);
    return generateFallbackEmbedding(`image-error:${err.message}`);
  }
};

/**
 * Embeds text into a 512-dim vector using prompt wrapping trick
 */
export const embedText = async (rawText) => {
  try {
    const cleaned = (rawText || '').trim();
    const prompt = cleaned.toLowerCase().startsWith('a photo of')
      ? cleaned
      : `a photo of ${cleaned}`;

    const models = await initializeCLIP();
    if (!models || loadFailed) {
      return generateFallbackEmbedding(`text:${prompt}`);
    }

    const textInputs = await models.tokenizer(prompt, {
      padding: true,
      truncation: true,
      max_length: 77
    });

    const { text_embeds } = await models.textModel(textInputs);
    return l2Normalize(Array.from(text_embeds.data));
  } catch (err) {
    console.error(`[CLIP] Error embedding text: ${err.message}`);
    return generateFallbackEmbedding(`text-error:${rawText}`);
  }
};

/**
 * Generates joint embedding for an item (image + text)
 */
export const generateItemEmbedding = async (itemData, imageBufferOrUrl = null) => {
  const { category = '', color = '', brand = '', title = '', description = '' } = itemData;

  const textInputString = `${category} ${color} ${brand} ${title}. ${description}`.trim();
  const textEmb = await embedText(textInputString);

  let imageEmb = null;
  if (imageBufferOrUrl) {
    imageEmb = await embedImage(imageBufferOrUrl);
  }

  let combinedEmbedding;
  if (imageEmb && textEmb) {
    const combined = new Array(512);
    for (let i = 0; i < 512; i++) {
      combined[i] = 0.7 * imageEmb[i] + 0.3 * textEmb[i];
    }
    combinedEmbedding = l2Normalize(combined);
  } else if (imageEmb) {
    combinedEmbedding = imageEmb;
  } else {
    combinedEmbedding = textEmb;
  }

  return {
    embedding: combinedEmbedding,
    imageEmbedding: imageEmb || undefined,
    textEmbedding: textEmb
  };
};
