import kebabCase from 'lodash.kebabcase';
import axios from 'axios';

import { DEFAULT_PROPERTY_WHITELIST } from './constants';
import { THiddenArgtypes } from './types';

function isColor(colorString: string): boolean {
    const s = new Option().style;

    s.color = colorString;

    return s.color === colorString;
}

function getStoryDocumentationUrl(storyParameters: Record<string, string>): string {
    const storyPathParts = storyParameters.title.split('/');
    const storyPath = storyPathParts.map((part) => kebabCase(part)).join('-');

    if (storyParameters.includeStories.length === 0) {
        return `/?path=/docs/${storyPath}--page`;
    }

    return `/?path=/docs/${storyPath}--${kebabCase(storyParameters.includeStories[0])}`;
}

/**
 * this is to prevent all properties to be passed down to the underlying
 * component, except for the ones we want to. (e.g. `type="button"`)
 * Leave the blackList empty or do not pass a value to allow all properties
 * to be passed dow.
 *
 * `data-*` and `aria-*` attributes are always passed down.
 *
 * It is to be used in the styled components `shouldForwardProp` config
 *
 * @example
 * ```typescript
 * // pass down `width` and `height` properties
 * const StyledDiv = styled.div.withConfig({
 *   shouldForwardProp: (property, validator) =>
 *     Utils.blockProperty(property, ['width', 'height']) && validator(property),
 * })<PDiv>` ... `
 *
 * // allow all properties to be passed down
 * const StyledSection = styled.section.withConfig({
 *   shouldForwardProp: (property, validator) =>
 *     Utils.blockProperty(property) && validator(property),
 * })<PSection>` ... `
 * ```
 * */
const blockProperty = (
    property: string | number | symbol,
    blackList: (string | number | symbol)[] = []
): boolean =>
    // forward the property when it is a `data-*`attribute
    property.toString().startsWith('data-') ||
    // forward the property when it is a `aria-*`attribute
    property.toString().startsWith('aria-') ||
    // always forward the property when it is defined within the property-whitelist
    DEFAULT_PROPERTY_WHITELIST.includes(property.toString()) ||
    // forward the property when it is defined within the passed property-whitelist
    !blackList.includes(property.toString());

/**
 * this function "force-forwards" a property.
 * it is especially helpful when you need to pass properties from an extended
 * root component to the component it inherits from
 *
 * in this example we want to force-forward (pass) properties to the
 * Icon component ButtonIconRoot is extending from, but since the default
 * validator function from styled-components does not handle 'glyph' and 'size'
 * as standard HTML attributes it blocks them fropm being passed on
 *
 * @example
 * ```typescript
 * const ButtonIconRoot = styled(Icon).withConfig<PButtonIconRoot>({
 *   shouldForwardProp: (property, validator) =>
 *       Utils.forceForwardProperty(property, ['glyph', 'size']) ||
 *       (Utils.blockProperty(property, ['width']) && validator(property)),
 * })(
 *   ({ margin, marginPosition }) => css`
 *       margin-${marginPosition}: ${margin}px;
 *     `
 * );
 * ```
 */
const forceForwardProperty = (
    property: string | number | symbol,
    whitelist: (string | number | symbol)[] = []
): boolean => whitelist.includes(property.toString());

/**
 * hide the properties that come with the styled component API
 * @returns {THiddenArgtypes}
 */
function hideStyledComponentProperties(): THiddenArgtypes {
    return {
        forwardedAs: { table: { disable: true } },
        theme: { table: { disable: true } },
        ref: { table: { disable: true } },
        as: { table: { disable: true } },
    };
}

/**
 * hide the components listed in the blacklist array
 * @param {string[]} [blacklist]
 * @returns {THiddenArgtypes}
 */
function hideComponentProperties(blacklist: string[] = []): THiddenArgtypes {
    return blacklist.reduce(
        (o, key) => Object.assign(o, { [key]: { table: { disable: true } } }),
        hideStyledComponentProperties()
    );
}

/* eslint-disable @typescript-eslint/no-explicit-any,no-console */
const isNumber = (x: any): x is number => typeof x === 'number';
const isString = (x: any): x is string => typeof x === 'string';
const isFunction = (x: any): x is Function => typeof x === 'function';

function warn(message: string, ...rest: any): void {
    console.warn(message, ...rest);
}
/* eslint-enable @typescript-eslint/no-explicit-any,no-console */

const getFontMargin = (fontSize: number, multiplier: number): number =>
    Math.max(Math.round((fontSize * multiplier) / 4) * 4, 8);

const getPxValue = (value: string | number): string => (isNumber(value) ? `${value}px` : value);

/**
 * Returns a number whose value is limited to the given range.
 * @param {number} value The value to be clamped
 * @param {number} min The lower boundary of the output range
 * @param {number} max The upper boundary of the output range
 * @returns {number} A number in the range [min, max]
 */
function clamp(value: number, min = 0, max = 1): number {
    if (value < min || value > max) {
        throw new Error(
            `Compass Components: The value provided ${value} is out of range [${min}, ${max}].`
        );
    }

    return Math.min(Math.max(min, value), max);
}

function getBase64(url: string): Promise<string> {
    return axios
        .get(url, {
            responseType: 'arraybuffer',
        })
        .then((response) => {
            const dataString = Buffer.from(response.data, 'binary').toString('base64');
            const dataType = response.headers['content-type'];

            return `data:${dataType};base64,${dataString}`;
        });
}

class CompassError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CompassError';
    }
}

/**
 * Asserts if a certain check is true. If not throw a CompassError with the provided message
 * @param {boolean} assertion
 * @param {string} message
 * @param {boolean} warnOnly
 */
function assert(assertion: boolean, message: string, warnOnly = false): void {
    if (!assertion) {
        if (warnOnly) {
            // eslint-disable-next-line no-console
            console.warn(message);

            return;
        }

        throw new CompassError(message);
    }
}

/**
 * This LITERALLY does NOTHING! :D
 * @returns {void}
 */
function noop(): void {}

const Utils = {
    warn,
    assert,
    clamp,
    isColor,
    isNumber,
    isFunction,
    isString,
    blockProperty,
    forceForwardProperty,
    getBase64,
    getStoryDocumentationUrl,
    hideComponentProperties,
    hideStyledComponentProperties,
    getFontMargin,
    getPxValue,
    noop,
};

export { CompassError };

export default Utils;