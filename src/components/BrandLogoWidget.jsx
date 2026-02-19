/**
 * BrandLogoWidget — Logo + Subtitle arrastável no canvas.
 *
 * Usa useDraggable do @dnd-kit para drag livre.
 * Sem resize (tamanho fixo).
 */
import PropTypes from "prop-types";
import { useDraggable } from "@dnd-kit/core";
import BrandLogo from "./BrandLogo";

function BrandLogoWidget({ position }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id: "brand-logo-widget" });

    const style = {
        position: "absolute",
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)`
            : undefined,
        zIndex: isDragging ? 200 : 100,
        transition: isDragging ? "none" : "box-shadow 0.2s ease",
        cursor: "grab",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`select-none ${isDragging ? "opacity-80 scale-[1.02]" : ""}`}
            {...listeners}
            {...attributes}
        >
            <BrandLogo />
            <p className="text-center text-white/40 text-sm mt-1 pointer-events-none">
                Organize suas metas de aprendizado tecnológico
            </p>
        </div>
    );
}

BrandLogoWidget.propTypes = {
    position: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
    }),
};

export default BrandLogoWidget;
