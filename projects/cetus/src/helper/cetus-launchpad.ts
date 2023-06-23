import { SuiContext } from "@sentio/sdk/sui"
export async function getIDOPoolMetadata(ctx: SuiContext, pool: string) {
    let [softcap, hardcap, reality_raise_total, sale_total] = [0, 0, 0, 0]
    try {
        const obj = await ctx.client.getObject({ id: pool, options: { showType: true, showContent: true } })
        softcap = Number(obj.data.content.fields.softcap)
        hardcap = Number(obj.data.content.fields.hardcap)
        reality_raise_total = Number(obj.data.content.fields.reality_raise_total)
        sale_total = Number(obj.data.content.fields.sale_total)
    }
    catch (e) {
        console.log(`${e.message} get ido pool object metadataError at ${pool}`)
    }
    return {
        softcap,
        hardcap,
        reality_raise_total,
        sale_total
    }
}