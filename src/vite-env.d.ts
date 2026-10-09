/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional. Public Formspree form ID, e.g. "xyzabcde". Leave unset to use the email fallback. */
  readonly VITE_FORMSPREE_FORM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
