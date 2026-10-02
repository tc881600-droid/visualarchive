/* Shared module wiring for the migrated Visual Archive.
   app-body.js is the VERBATIM JS from index.html's <script type="text/babel"> block.
   This file provides the same globals it expects (React UMD, window.Motion, Lenis, supabase),
   so the original code runs unmodified under Vite/ESM. */
import React from 'react';
import ReactDOM from 'react-dom';
import * as FMlib from 'framer-motion';
import Lenis from 'lenis';
import { createClient } from '@supabase/supabase-js';

window.React = React;
window.ReactDOM = ReactDOM;
window.Motion = {
  motion: FMlib.motion,
  AnimatePresence: FMlib.AnimatePresence,
  useScroll: FMlib.useScroll,
  useTransform: FMlib.useTransform,
  useMotionValueEvent: FMlib.useMotionValueEvent,
  useAnimationControls: FMlib.useAnimationControls,
  useMotionValue: FMlib.useMotionValue,
  useSpring: FMlib.useSpring,
};
window.Lenis = Lenis;
window.supabase = { createClient };
export {};
