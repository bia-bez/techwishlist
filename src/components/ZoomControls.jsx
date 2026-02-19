import { Plus, Minus, RotateCcw } from "lucide-react";
import PropTypes from "prop-types";

function ZoomControls({ scale, onZoomIn, onZoomOut, onReset }) {
    return (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
            <button
                onClick={onZoomIn}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-lg text-white transition-all shadow-lg active:scale-95"
                title="Zoom In"
            >
                <Plus size={20} />
            </button>
            <button
                onClick={onZoomOut}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-lg text-white transition-all shadow-lg active:scale-95"
                title="Zoom Out"
            >
                <Minus size={20} />
            </button>
            <button
                onClick={onReset}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-lg text-white transition-all shadow-lg active:scale-95"
                title="Reset View"
            >
                <RotateCcw size={16} />
            </button>
            <div className="text-center text-xs font-mono text-white/40 bg-black/50 rounded px-1 py-0.5 mt-1 backdrop-blur-sm">
                {Math.round(scale * 100)}%
            </div>
        </div>
    );
}

ZoomControls.propTypes = {
    scale: PropTypes.number.isRequired,
    onZoomIn: PropTypes.func.isRequired,
    onZoomOut: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
};

export default ZoomControls;
