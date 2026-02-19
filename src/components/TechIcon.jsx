/**
 * Componente TechIcon — exibe o ícone da tecnologia.
 *
 * Se a tecnologia for reconhecida (existe no mapeamento), exibe o SVG do Devicon.
 * Caso contrário, exibe a primeira letra do nome como fallback.
 *
 * Dica: O Devicon (devicon.dev) é um projeto open source com 700+ ícones
 * de tecnologias de desenvolvimento. Usamos o CDN via jsDelivr.
 */
import { useState } from "react";
import PropTypes from "prop-types";
import { getTechIcon } from "../data/techIcons";

function TechIcon({ name, size = 32 }) {
    const [imgError, setImgError] = useState(false);
    const icon = getTechIcon(name);

    // Se encontrou o ícone e ele carregou sem erro, exibe o SVG
    if (icon && !imgError) {
        return (
            <img
                src={icon.iconUrl}
                alt={icon.label}
                width={size}
                height={size}
                className="tech-icon"
                onError={() => setImgError(true)}
                loading="lazy"
            />
        );
    }

    // Fallback: primeira letra do nome em um círculo colorido
    const initial = name ? name.charAt(0).toUpperCase() : "?";

    // Gera uma cor baseada no nome (determinística)
    const hue = name
        ? name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
        : 200;

    return (
        <div
            className="tech-icon-fallback"
            style={{
                width: size,
                height: size,
                fontSize: size * 0.45,
                background: `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${hue + 30}, 70%, 40%))`,
            }}
        >
            {initial}
        </div>
    );
}

TechIcon.propTypes = {
    name: PropTypes.string.isRequired,
    size: PropTypes.number,
};

export default TechIcon;
