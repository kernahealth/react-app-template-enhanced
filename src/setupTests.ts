import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder (needed for React Router in Jest)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
