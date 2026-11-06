"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function VotingOrbitScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    animationId: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0x4a90ff, 1.5);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x7854d8, 1);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Central glowing sphere (vote icon representation)
    const sphereGeometry = new THREE.IcosahedronGeometry(1, 1);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x004ac6,
      emissive: 0x004ac6,
      emissiveIntensity: 0.3,
      shininess: 100,
      transparent: true,
      opacity: 0.9,
    });
    const centralSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(centralSphere);

    // Outer glow for central sphere
    const glowGeometry = new THREE.IcosahedronGeometry(1.15, 1);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4a90ff,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    centralSphere.add(glowMesh);

    // Orbiting particles (representing votes)
    const particles: THREE.Mesh[] = [];
    const particleGeometry = new THREE.SphereGeometry(0.08, 16, 16);

    const createParticle = (radius: number, speed: number, color: number) => {
      const material = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        shininess: 100,
      });
      const particle = new THREE.Mesh(particleGeometry, material);
      
      // Random starting position on orbit
      const angle = Math.random() * Math.PI * 2;
      particle.position.x = Math.cos(angle) * radius;
      particle.position.z = Math.sin(angle) * radius;
      particle.position.y = (Math.random() - 0.5) * 0.5;
      
      (particle as any).orbitRadius = radius;
      (particle as any).orbitSpeed = speed;
      (particle as any).orbitAngle = angle;
      
      scene.add(particle);
      particles.push(particle);
    };

    // Create particles at different orbits
    createParticle(2.5, 0.3, 0x4a90ff);
    createParticle(2.5, 0.35, 0x7854d8);
    createParticle(3, 0.25, 0x004ac6);
    createParticle(3, 0.28, 0x3659d9);
    createParticle(3.5, 0.2, 0x4a90ff);
    createParticle(3.5, 0.22, 0x7854d8);

    // Orbit rings
    const createOrbitRing = (radius: number, color: number, opacity: number) => {
      const curve = new THREE.EllipseCurve(
        0, 0,
        radius, radius,
        0, 2 * Math.PI,
        false,
        0
      );
      const points = curve.getPoints(64);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
      });
      const ring = new THREE.Line(geometry, material);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      return ring;
    };

    const ring1 = createOrbitRing(2.5, 0x4a90ff, 0.15);
    const ring2 = createOrbitRing(3, 0x7854d8, 0.12);
    const ring3 = createOrbitRing(3.5, 0x004ac6, 0.1);

    // Animation
    let time = 0;
    const animate = () => {
      if (!prefersReducedMotion) {
        time += 0.01;

        // Rotate central sphere
        centralSphere.rotation.y += 0.005;
        centralSphere.rotation.x += 0.003;

        // Pulse glow
        glowMesh.scale.set(
          1 + Math.sin(time * 2) * 0.05,
          1 + Math.sin(time * 2) * 0.05,
          1 + Math.sin(time * 2) * 0.05
        );
        glowMaterial.opacity = 0.15 + Math.sin(time * 2) * 0.08;

        // Animate particles
        particles.forEach((particle) => {
          const p = particle as any;
          p.orbitAngle += p.orbitSpeed * 0.01;
          particle.position.x = Math.cos(p.orbitAngle) * p.orbitRadius;
          particle.position.z = Math.sin(p.orbitAngle) * p.orbitRadius;
          particle.position.y = Math.sin(p.orbitAngle * 2) * 0.3;
        });

        // Slowly rotate orbit rings
        ring1.rotation.z += 0.001;
        ring2.rotation.z -= 0.0008;
        ring3.rotation.z += 0.0006;
      }

      renderer.render(scene, camera);
      sceneRef.current!.animationId = requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    sceneRef.current = { scene, camera, renderer, animationId };

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        
        // Dispose geometries and materials
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        
        renderer.dispose();
        
        if (containerRef.current && renderer.domElement.parentNode) {
          containerRef.current.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ minHeight: "620px" }}
    />
  );
}
