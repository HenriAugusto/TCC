/**
 * A medium-sized 4-bar, 90-class onehot melody model. Quantized to 2-byte weights.
 */
music_vae_mel_4bar_q2 = new mm.MusicVAE("https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_q2");
music_vae_mel_4bar_q2.initialize();

/**
 * A 2-bar, 90-class onehot melody model with chord conditioning. Quantized to 2-byte weights.
 */
music_vae_2bar_chords = new mm.MusicVAE("https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_chords");
// music_vae_2bar_chords.initialize();

/**
 * A 2-bar, 90-class onehot melody model. Less accurate, but smaller in size than full model.
 */
music_vae_2bar_small = new mm.MusicVAE("https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small");
// music_vae_2bar_small.initialize();

/**
 * A 2-bar, 9-class multilabel drum model with a NADE decoder. Quantized to 2-byte weights.
 */
drums_vae_2bar_nade_9_q2 = new mm.MusicVAE("https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/drums_2bar_nade_9_q2");
// drums_vae_2bar_nade_9_q2.initialize();

/**
 * A medium-sized 2-bar, 9-class onehot drum model with a weak prior (higher KL divergence), 
 * which is better for reconstructions and interpolations. Quantized to 2-byte weights.
 */
drums_vae_4bar_med_q2 = new mm.MusicVAE("https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/drums_4bar_med_q2");
// drums_vae_4bar_med_q2.initialize();

/**
 * A medium-sized 2-bar, 9-class onehot drum model with a strong prior (lower KL divergence),
 * which is better for sampling. Quantized to 2-byte weights.
 */
drums_4bar_med_lokl_q2 = new mm.MusicVAE("https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/drums_4bar_med_lokl_q2");
drums_4bar_med_lokl_q2.initialize();

vae_temperature = 0.1;