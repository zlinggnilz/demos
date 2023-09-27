import { createRef, forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import type { ViewerConfig } from '@photo-sphere-viewer/core';
import { events, Viewer } from '@photo-sphere-viewer/core';

// import '@photo-sphere-viewer/core/index.css';
import './styles.css';
import './pano.scss';

const defaultOptions = {
  moveSpeed: 1,
  zoomSpeed: 1,
  defaultZoomLvl: 20,
  minFov: 30,
  maxFov: 90,
  loadingTxt: '加载中',
};

type EventProps = {
  onPositionChange?: (lat: number, lng: number, instance: Viewer) => void;
  onZoomChange?: (data: events.ZoomUpdatedEvent & { type: 'zoom-updated' }, instance: Viewer) => void;
  onClick?: (data: events.ClickEvent & { type: 'click' }, instance: Viewer) => void;
  onDblclick?: (data: events.ClickEvent & { type: 'dblclick' }, instance: Viewer) => void;
  onReady?: (instance: Viewer) => void;
};

const PhotoSphereViewer = forwardRef(
  (
    {
      className,
      viewerRef,
      onReady,
      onClick,
      onDblclick,
      onZoomChange,
      onPositionChange,
      options,
    }: { className?: string; viewerRef?: any; options: Omit<ViewerConfig, 'container'> } & EventProps,
    ref,
  ) => {
    const sphereElementRef = createRef<HTMLDivElement>();

    const shperePlayerInstance = useRef<Viewer | null>(null);

    const destroy = useCallback(() => {
      const vRef = viewerRef || shperePlayerInstance;
      vRef.current?.destroy?.();
    }, []);

    useEffect(() => {
      if (!sphereElementRef.current) {
        return;
      }
      const vRef = viewerRef || shperePlayerInstance;
      const _c = new Viewer({
        ...defaultOptions,
        ...options,
        container: sphereElementRef.current,
      });
      vRef.current = _c;

      _c.addEventListener(
        'ready',
        () => {
          onReady && onReady(_c);
        },
        { once: true },
      );
      _c.addEventListener('click', (data: events.ClickEvent & { type: 'click' }) => {
        onClick && onClick(data, _c);
      });
      _c.addEventListener('dblclick', (data: events.ClickEvent & { type: 'dblclick' }) => {
        onDblclick && onDblclick(data, _c);
      });

      _c.addEventListener('zoom-updated', (zoom: events.ZoomUpdatedEvent & { type: 'zoom-updated' }) => {
        onZoomChange && onZoomChange(zoom, _c);
      });
      _c.addEventListener(
        'position-updated',
        (position: events.PositionUpdatedEvent & { type: 'position-updated' }) => {
          onPositionChange && onPositionChange(position.position.pitch, position.position.yaw, _c);
        },
      );

      return () => {
        destroy();
      };
    }, [sphereElementRef.current]);

    useImperativeHandle(
      ref,
      () => {
        const vRef = viewerRef || shperePlayerInstance;
        return {
          destroy,
          viewerRef: vRef,
          getPlugin(pluginName: string) {
            return vRef.current?.getPlugin(pluginName);
          },
        };
      },
      [],
    );

    return <div ref={sphereElementRef} className={className || 'view-container'} />;
  },
);

export default PhotoSphereViewer;
