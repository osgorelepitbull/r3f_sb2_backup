// inspired by https://dribbble.com/shots/14195587-Landing-page-for-gold-jewelry-website

import React, { useCallback, useEffect, useRef, useMemo } from "react";
import ReactDOM from "react-dom";
import "./global.css";
import App from "./App";
import * as THREE from "three";
import { Canvas, extend, useFrame, useThree } from "react-three-fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import "./styles.css";

// Makes these prototypes available as "native" jsx-string elements
extend({
  EffectComposer,
  ShaderPass,
  RenderPass,
  AfterimagePass,
  UnrealBloomPass
});

ReactDOM.render(<App />, document.getElementById("root"));
