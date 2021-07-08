import styled, { css } from 'styled-components';
import { FlattenSimpleInterpolation, ThemedStyledProps } from 'styled-components/ts3.6';

import { setAlpha, blendColors } from '../../shared';
import Spacing from '../../utilities/spacing';
import { applyPadding } from '../../utilities/layout';
import { TTheme } from '../../utilities/theme';
import { applyShape } from '../../foundations/shape';
import { applyTextMargin, applyTextStyles } from '../text';

import { PMenuItemRoot, PMenuItemTextRoot } from './MenuItem.props';

const MenuItemLabelRoot = styled.span<PMenuItemTextRoot>(
    (): FlattenSimpleInterpolation => css`
        ${applyTextStyles({ size: 100, weight: 'bold' })};
        ${applyTextMargin({ margin: 'none' })};
    `
);

const MenuItemDescriptionRoot = styled.span<PMenuItemTextRoot>(
    (): FlattenSimpleInterpolation => css`
        ${applyTextMargin({ margin: 'none' })};
        ${applyTextStyles({ size: 75, weight: 'regular' })};
    `
);

const MenuItem = styled.div<PMenuItemRoot>(
    ({
        destructive,
        theme: { background, palette, action, text },
    }: ThemedStyledProps<PMenuItemRoot, TTheme>): FlattenSimpleInterpolation => {
        const { main, contrast } = destructive ? palette.alert : palette.primary;
        const colors = {
            hover: destructive ? main : blendColors(background.shape, setAlpha(action.hover, 0.08)),
            active: destructive
                ? blendColors(main, setAlpha(action.hover, 0.16))
                : blendColors(background.shape, setAlpha(main, 0.08)),
            text: destructive ? main : setAlpha(text.primary, 0.56),
        };

        return css`
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;

            background-color: ${background.shape};
            color: ${colors.text};

            ${applyShape({ radius: 0, width: '100%' })};
            ${applyPadding(Spacing.trbl({ top: 100, right: 175, bottom: 100, left: 200 }))};

            :hover {
                background: ${colors.hover};
                color: ${destructive ? contrast : colors.text};
            }

            :active {
                background: ${colors.active};
                color: ${destructive ? contrast : colors.text};
            }

            &:focus {
                background: ${destructive ? main : background.shape};
                box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.32), inset 0 0 0 2px ${main};
                color: ${destructive ? contrast : colors.text};
            }

            &:focus:not(:focus-visible) {
                box-shadow: none;
            }

            &:focus-visible {
                outline: none;
                background: ${destructive ? main : background.shape};
                box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.32), inset 0 0 0 2px ${main};
                color: ${destructive ? contrast : colors.text};
            }

            ${MenuItemLabelRoot} {
                color: ${destructive ? 'inherit' : text.primary};
            }

            transition: background 250ms ease-in-out, color 250ms ease-in-out,
                box-shadow 250ms ease-in-out;
        `;
    }
);

export { MenuItemLabelRoot, MenuItemDescriptionRoot };

export default MenuItem;
