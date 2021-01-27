import * as THREE from "three";
import React, {
  Suspense,
  useLayoutEffect,
  useMemo,
  useRef,
  useCallback,
  useEffect
} from "react";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { Flock } from "./flock";
import "./styles.css";
import { Canvas, extend, useThree, useFrame } from "react-three-fiber";
import { Environment } from "@react-three/drei/Environment";
import { Loader, useTexture, useGLTF, Shadow } from "@react-three/drei";
import { useTransition, useSpring } from "@react-spring/core";
import { a } from "@react-spring/three";
import { useLocation, Switch, Route } from "wouter";
import DistortionMaterial from "./DistortionMaterial";
import { Container, Jumbo, Nav, Box, Line, Cover } from "./Styles";

const torus = new THREE.TorusBufferGeometry(4, 1.2, 128, 128);
const torusknot = new THREE.TorusKnotBufferGeometry(3, 0.8, 256, 16);
const material1 = new DistortionMaterial();
const material2 = new DistortionMaterial();
const material3 = new DistortionMaterial();
const jumbo = {
  "/": ["SYB1L", "BLABLA"],
  "/knot": ["OcTo COre", "Extra Fight."],
  "/video": ["Galaxy", "flavor", "based."]
};

extend({
  EffectComposer,
  ShaderPass,
  RenderPass,
  AfterimagePass,
  UnrealBloomPass
});

function Effect() {
  const composer = useRef();
  const { scene, gl, size, camera } = useThree();
  const aspect = useMemo(() => new THREE.Vector2(size.width, size.height), [
    size
  ]);
  useEffect(() => void composer.current.setSize(size.width, size.height), [
    size
  ]);
  useFrame(() => composer.current.render(), 1);
  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      <unrealBloomPass attachArray="passes" args={[aspect, 1.3, 1, 0]} />
      <shaderPass
        attachArray="passes"
        args={[FXAAShader]}
        uniforms-resolution-value={[1 / size.width, 1 / size.height]}
        renderToScreen
      />
    </effectComposer>
  );
}

/*
function FlockApp() {
  const mouse = useRef([0, 0, false]);

  const onMouseMove = useCallback(
    ({ clientX: x, clientY: y }) =>
      (mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2]),
    []
  );

  const handleMouseDown = (event) => {
    if (event.button !== 2) {
      mouse.current[2] = true;
    }
  };

  const handleMouseUp = (event) => {
    if (event.button !== 2) {
      mouse.current[2] = false;
    }
  };

  return (
    <div
      style={{ width: "100%", height: "100%" }}
      onMouseMove={onMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <Canvas camera={{ fov: 75, position: [0, 0, 70] }}>
        <spotLight
          intensity={0.15}
          position={[0, 0, 70]}
          penumbra={1}
          color="lightblue"
        />
        <mesh>
          <planeBufferGeometry attach="geometry" args={[10000, 10000]} />
          <meshPhongMaterial
            attach="material"
            color="#272727"
            depthTest={false}
          />
        </mesh>
        <Flock mouse={mouse} count={600} />
        <Effect />
      </Canvas>
    </div>
  );
}
*/

function Shape({
  geometry,
  material,
  args,
  textures,
  opacity,
  color,
  shadowScale = [9, 1.5, 1],
  ...props
}) {
  const ref = useRef();
  const { mouse, clock } = useThree();
  const [ao, normal, height, roughness] = textures;
  const [rEuler, rQuaternion] = useMemo(
    () => [new THREE.Euler(), new THREE.Quaternion()],
    []
  );
  useFrame(() => {
    if (ref.current) {
      rEuler.set((-mouse.y * Math.PI) / 10, (mouse.x * Math.PI) / 6, 0);
      ref.current.quaternion.slerp(rQuaternion.setFromEuler(rEuler), 0.1);
      ref.current.material.time = clock.getElapsedTime() * 3;
    }
  });
  return (
    <group {...props}>
      <a.mesh
        ref={ref}
        args={args}
        geometry={geometry}
        material={material}
        material-color={color}
        material-aoMap={ao}
        material-normalMap={normal}
        material-displacementMap={height}
        material-roughnessMap={roughness}
        material-opacity={opacity}
      >
        <Shadow opacity={0.2} scale={shadowScale} position={[0, -8.5, 0]} />
      </a.mesh>
    </group>
  );
}

function Shapes({ transition }) {
  const { nodes } = useGLTF("/F16D.gltf");
  const textures = useTexture([
    "/ao.jpg",
    "/normal.jpg",
    "/height.png",
    "/roughness.jpg"
  ]);
  useLayoutEffect(() => {
    textures.forEach(
      (texture) => (
        (texture.wrapT = texture.wrapS = THREE.RepeatWrapping),
        texture.repeat.set(4, 4)
      )
    );
  }, [textures]);
  return transition(({ opacity, ...props }, location) => (
    <a.group {...props}>
      <Switch location={location}>
        <Route path="/">
          <Shape
            geometry={torus}
            material={material1}
            textures={textures}
            color="white"
            opacity={opacity}
          />
        </Route>
        <Route path="/knot">
          <Shape
            geometry={torusknot}
            material={material2}
            textures={textures}
            color="#272730"
            opacity={opacity}
          />
        </Route>
        <Route path="/video">
          <Shape
            material={material3}
            textures={textures}
            scale={[0.7, 0.7, 0.7]}
            rotation={[0, 0.5, 0]}
            shadowScale={[17, 2.5, 1]}
            color="black"
            opacity={opacity}
          />
        </Route>
      </Switch>
    </a.group>
  ));
}

function Text({ children, opacity, background }) {
  return (
    <Box style={{ opacity }}>
      {React.Children.toArray(children).map((text, index) => (
        <Line
          key={index}
          style={{
            transform: opacity.to(
              (t) =>
                `translate3d(0,${
                  index * -50 + (1 - t) * ((1 + index) * 40)
                }px,0)`
            )
          }}
        >
          <div>{text}</div>
          <Cover
            style={{
              background,
              transform: opacity.to(
                (t) => `translate3d(0,${t * 100}%,0) rotateZ(-10deg)`
              )
            }}
          />
        </Line>
      ))}
    </Box>
  );
}

export default function App() {
  // Current route
  const [location] = useLocation();
  // Animated background color
  const props = useSpring({
    background:
      location === "/"
        ? "#9d169f"
        : location === "/knot"
        ? "#2622cf"
        : "#ffdb14",
    color:
      location === "/"
        ? "#f679c5"
        : location === "/knot"
        ? "#f679c5"
        : "#f679c5"
  });
  // Animated shape props
  const transition = useTransition(location, {
    from: {
      position: [0, 0, -20],
      rotation: [0, Math.PI, 0],
      scale: [0, 0, 0],
      opacity: 0
    },
    enter: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      opacity: 1
    },
    leave: {
      position: [0, 0, -10],
      rotation: [0, -Math.PI, 0],
      scale: [0, 0, 0],
      opacity: 0
    },
    config: () => (n) => n === "opacity" && { friction: 60 }
  });

  /* Mouse properties */
  const mouse = useRef([0, 0, false]);
  const onMouseMove = useCallback(
    ({ clientX: x, clientY: y }) =>
      (mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2]),
    []
  );
  const handleMouseDown = (event) => {
    if (event.button !== 2) {
      mouse.current[2] = true;
    }
  };
  const handleMouseUp = (event) => {
    if (event.button !== 2) {
      mouse.current[2] = false;
    }
  };

  return (
    <div
      id="main-container"
      onMouseMove={onMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <Container style={{ ...props }}>
        <Jumbo>
          {transition((style, location) => (
            <Text
              open={true}
              t={style.t}
              opacity={style.opacity}
              background={props.background}
              children={jumbo[location]}
            />
          ))}
        </Jumbo>
      </Container>
      <Canvas
        concurrent
        camera={{ position: [0, 0, 20], fov: 50 }}
        onCreated={({ gl }) => (gl.toneMappingExposure = 1.5)}
      >
        <spotLight position={[0, 30, 40]} />
        <spotLight position={[-50, 30, 40]} />
        <Suspense fallback={null}>
          <Shapes transition={transition} />
          <Environment files="photo_studio_01_1k.hdr" />
        </Suspense>
        <Flock mouse={mouse} count={600} />
        <Effect />
      </Canvas>
      <Nav style={{ color: props.color }} />
      <Loader />
    </div>
  );
}
