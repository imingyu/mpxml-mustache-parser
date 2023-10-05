type FindTarget = 'left' | 'content';

interface MxpBasicToken {
    startOffset: number;
    endOffset: number;
}

export interface MxpTextToken extends MxpBasicToken {
    type: 'text';
    content: string;
}

export interface MxpMustacheToken extends MxpBasicToken {
    type: 'mustache';
    content: string;
}

export type MxpToken = MxpTextToken | MxpMustacheToken;

export const parse = (text: string): MxpToken[] => {
    const res: MxpToken[] = [];
    const len = text.length;
    let findTarget: FindTarget = 'left';
    let tokens = '';
    let leftStartOffset;
    let innerString;
    let prevIndex = 0;
    const leftDone = (index: number) => {
        if (tokens.length) {
            res.push({
                type: 'text',
                content: tokens,
                startOffset: prevIndex || 0,
                endOffset: index - 1
            });
            tokens = '';
        }
        leftStartOffset = index;
        findTarget = 'content';
    };
    const contentDone = (index: number) => {
        res.push({
            type: 'mustache',
            content: tokens,
            startOffset: leftStartOffset,
            endOffset: index + 1
        });
        tokens = '';
        leftStartOffset = undefined;
        prevIndex = index + 2;
        findTarget = 'left';
    };
    /**
     * {{ name + '{{'}}
     */
    for (let i = 0; i < len; i++) {
        const char = text[i];
        if (findTarget === 'left') {
            if (char === '{' && text[i + 1] === '{') {
                leftDone(i);
                i++;
                continue;
            }
            tokens += char;
            continue;
        }
        // eslint-disable-next-line quotes
        if (char === '"' || char === "'") {
            innerString = !innerString;
            tokens += char;
            continue;
        }
        if (!innerString && char === '}' && text[i + 1] === '}') {
            contentDone(i);
            i++;
            continue;
        }
        tokens += char;
    }
    if (tokens.length) {
        res.push({
            type: 'text',
            content: tokens,
            startOffset: prevIndex || 0,
            endOffset: len - 1
        });
    }
    return res;
};

export const serialize = (tokens: MxpToken[]) => {
    return tokens.reduce((sum, item) => {
        let str;
        if (item.type === 'text') {
            str = item.content;
        } else if (item.type === 'mustache') {
            str = `{{ ${item.content} }}`;
        }
        return sum + str;
    }, '');
};
