const fs = require('fs')
const AxeBuilder = require('@axe-core/playwright').default;

async function checkA11y(page, testInfo) {
    const results = await new AxeBuilder({ page })
    .disableRules([
        'html-has-lang'
    ])
    .withTags('wcag2a')
    .exclude('.element-to-ignore')
    .analyze();

    const { violations } = results;

    if(typeof violations === 'undefined'){
        throw new Error('No violations found in Axe check')
    }
    const lineBreak = '\n\n'

    const reporter = () => {
        if(violations.length === 0){
            return [];
        }
        return violations.map((violation) => {
            const foundViolation = violation.nodes.map((node) => {
                const selector = node.target.join(', ');
                const header = `Axe has found accessibility violations in "${testInfo.title} test in project ${testInfo.project.name}" at "${selector}" element on "${page.url()}" path: ${lineBreak}`;
                return (
                    `${header}
                    Impact: ${violation.impact} ${lineBreak}
                    Violation description: ${violation.help} ${lineBreak}
                    HTML: ${node.html} ${lineBreak}
                    You can find more about this violation here: ${violation.helpUrl}${lineBreak}
                    ----------------------------------------------------------------------------${lineBreak}`
                )
            }).join(lineBreak);
            return foundViolation;
        }).join(`${lineBreak}--------------------------------------------------------------------${lineBreak}`)
    };
    const formattedViolations = reporter(violations);
    let message = `Report Date: ${new Date()} ${lineBreak} ${formattedViolations}`;
    if(violations.length === 0) message = '';
    const path = './a11y-report.txt'
    fs.writeFile(path, message, { flag: 'a' }, () => {});
}
module.exports = checkA11y;