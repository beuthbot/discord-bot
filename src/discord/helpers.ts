export function stripMentions(message){
    const mention = /<@(.*?)>/;
    return message.replace(mention, '').trim();
}