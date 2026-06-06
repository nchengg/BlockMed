# Regenerates unpacked/ppt/slides/slide5.xml as the Product Architecture slide,
# matching the deck house style (cream F7F4EF, Aptos / Aptos Display, tinted cards
# with a left accent bar, kicker marker + page number).
import re

NS = ('xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
      'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"')

# palette
NAVY="0B1B3A"; TEAL="0E8C7F"; BLUE="1F6FB2"; AMBER="C77D18"; PURPLE="5A4FBF"
GREY="6B7280"; INK="1B2430"; CREAM="F7F4EF"; WHITE="FFFFFF"; HAIR="D8D2C7"; ICE="CADCFC"
T_BLUE="DDEAF5"; T_TEAL="DCEFEB"

_id = [40]
def nid():
    _id[0]+=1; return _id[0]

def esc(s):
    return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")

def transparent():
    return ('<a:solidFill><a:srgbClr val="000000"><a:alpha val="0"/></a:srgbClr></a:solidFill>'
            '<a:ln w="0"><a:solidFill><a:srgbClr val="000000"><a:alpha val="0"/></a:srgbClr>'
            '</a:solidFill><a:prstDash val="solid"/></a:ln>')

def fill_rect(x,y,cx,cy,fill,line=None,lw=9525,name="rect"):
    ln = (f'<a:ln w="{lw}"><a:solidFill><a:srgbClr val="{line}"/></a:solidFill>'
          f'<a:prstDash val="solid"/></a:ln>') if line else (
          '<a:ln w="0"><a:solidFill><a:srgbClr val="000000"><a:alpha val="0"/></a:srgbClr>'
          '</a:solidFill><a:prstDash val="solid"/></a:ln>')
    return f'''<p:sp><p:nvSpPr><p:cNvPr id="{nid()}" name="{name}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
<p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>
<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
<a:solidFill><a:srgbClr val="{fill}"/></a:solidFill>{ln}</p:spPr>
<p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr/></a:p></p:txBody></p:sp>'''

def arrow(x,y,cx,cy,fill,name="arrow"):
    return f'''<p:sp><p:nvSpPr><p:cNvPr id="{nid()}" name="{name}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
<p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>
<a:prstGeom prst="downArrow"><a:avLst/></a:prstGeom>
<a:solidFill><a:srgbClr val="{fill}"/></a:solidFill>
<a:ln w="0"><a:solidFill><a:srgbClr val="000000"><a:alpha val="0"/></a:srgbClr></a:solidFill></a:ln></p:spPr>
<p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr/></a:p></p:txBody></p:sp>'''

def run(text,sz,color,bold,font="Aptos"):
    b = "1" if bold else "0"
    return (f'<a:r><a:rPr sz="{sz}" b="{b}"><a:solidFill><a:srgbClr val="{color}"/></a:solidFill>'
            f'<a:latin typeface="{font}"/><a:ea typeface="{font}"/><a:cs typeface="{font}"/></a:rPr>'
            f'<a:t>{esc(text)}</a:t></a:r>')

def para(runs,algn="l",space_before=0):
    sb = f'<a:spcBef><a:spcPts val="{space_before}"/></a:spcBef>' if space_before else ''
    return f'<a:p><a:pPr algn="{algn}">{sb}</a:pPr>{runs}</a:p>'

def textbox(x,y,cx,cy,paras,anchor="t",name="txt"):
    return f'''<p:sp><p:nvSpPr><p:cNvPr id="{nid()}" name="{name}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
<p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>
<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>{transparent()}</p:spPr>
<p:txBody><a:bodyPr lIns="0" tIns="0" rIns="0" bIns="0" anchor="{anchor}" wrap="square"><a:normAutofit/></a:bodyPr>
<a:lstStyle/>{paras}</p:txBody></p:sp>'''

shapes=[]
# background
shapes.append(fill_rect(0,0,12192000,6858000,CREAM,name="bg"))
# kicker marker + label
shapes.append(fill_rect(533400,438150,76200,76200,NAVY,name="kicker-marker"))
shapes.append(textbox(723900,361950,5334000,228600,
    para(run("PRODUCT ARCHITECTURE",900,GREY,True)),anchor="ctr",name="kicker"))
# title
shapes.append(textbox(533400,685800,11125200,900000,
    para(run("Three trust tiers — narrow on-chain, smart off-chain, one bridge between.",3000,NAVY,True,"Aptos Display")),
    name="title"))
# subhead
shapes.append(textbox(533400,1670000,11125200,420000,
    para(run("The smart contract never sees a document — it holds funds and enforces state. All verification is off-chain; one authorised releaser key is the only path to on-chain money.",1400,INK,False)),
    name="subhead"))

# ===== LEFT COLUMN: three-tier stack =====
LX=533400; LW=6300000; BAR=57150; TX=723900; TW=5959500

def tier(y,h,fill,line,header,body,dark=False):
    hcol = WHITE if dark else NAVY
    bcol = ICE if dark else GREY
    shapes.append(fill_rect(LX,y,LW,h,fill,line=line,name="tier-card"))
    shapes.append(fill_rect(LX,y,BAR,h,line,name="tier-bar"))
    paras = (para(run(header,1250,hcol if not dark else WHITE,True))
             + para(run(body,1000,bcol,False),space_before=300))
    shapes.append(textbox(TX,y+120000,TW,h-200000,paras,anchor="ctr",name="tier-txt"))

# CLIENT
tier(2120000,980000,T_BLUE,BLUE,
     "CLIENT TIER  ·  Buyer · Seller · Reviewer",
     "Every read/write goes through one authenticated API. Wallets sign deposit / release straight to the chain.")
# connector 1
shapes.append(arrow(900000,3130000,228600,240000,GREY,name="conn1-arrow"))
shapes.append(textbox(1230000,3150000,5400000,240000,
    para(run("HTTPS · all app data via the authenticated API  (full API integration)",950,GREY,True)),
    anchor="ctr",name="conn1-label"))
# OFF-CHAIN
tier(3400000,1330000,T_TEAL,TEAL,
     "OFF-CHAIN ORCHESTRATION + VERIFICATION",
     "deal-intake · KYC / sanctions · document-checker + rules engine · dispute · settlement. AI reads, deterministic code computes the money, a human signs off. The append-only audit ledger is the regulator-facing source of truth.")
# connector 2 - the hero bridge
shapes.append(arrow(880000,4760000,300000,310000,NAVY,name="bridge-arrow"))
shapes.append(textbox(1260000,4790000,5350000,260000,
    para(run("releaser key — the ONE bridge:  off-chain verdict → recordVerdict on-chain",1000,NAVY,True)),
    anchor="ctr",name="bridge-label"))
# ON-CHAIN (dark vault card)
tier(5090000,980000,NAVY,NAVY,
     "ON-CHAIN TIER  ·  narrow Escrow contract  ·  Base Sepolia (EVM L2)",
     "Holds USDC · enforces the state machine · emits events. It never sees a trade document.",
     dark=True)

# ===== RIGHT COLUMN: design-decision chips =====
RX=7050000; RW=4608600; RTX=7240500; RTW=4268100
shapes.append(textbox(RX,2120000,RW,260000,
    para(run("DESIGN DECISIONS — WHY THE BUILD HOLDS",950,GREY,True)),anchor="ctr",name="right-head"))

chips=[
 (NAVY,  "Narrow contract",                "AP-1",
  "On-chain code holds funds + state only — no document logic, no money math. Small attack surface, chain-portable."),
 (TEAL,  "Permissionless release",          "AP-7",
  "Release isn’t gated on our key — a cleared seller can always be paid. Liveness without trusting the operator."),
 (BLUE,  "Audit around every action",       "AP-4",
  "Intent logged before the tx, reconciliation after. The ledger — not the chain — is the source of truth."),
 (AMBER, "Money in code, human above the line","AP-5 / 7",
  "All arithmetic is deterministic code; anything outside the autonomy thresholds escalates to a human sign-off."),
]
cy0=2500000; chh=815000; gap=95000
for i,(acc,head,tag,body) in enumerate(chips):
    y=cy0+i*(chh+gap)
    shapes.append(fill_rect(RX,y,RW,chh,WHITE,line=HAIR,name="chip-card"))
    shapes.append(fill_rect(RX,y,BAR,chh,acc,name="chip-bar"))
    head_p=para(run(head+"   ",1150,NAVY,True)+run(tag,900,acc,True))
    body_p=para(run(body,950,GREY,False),space_before=300)
    shapes.append(textbox(RTX,y+110000,RTW,chh-180000,head_p+body_p,anchor="ctr",name="chip-txt"))

# page number
shapes.append(textbox(11106150,6438900,552450,228600,
    para(run("05",900,GREY,True),algn="r"),name="pagenum"))

spTree = ('<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
          '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
          '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
          + "".join(shapes) + '</p:spTree>')

xml = (f'<?xml version="1.0" encoding="utf-8"?>\n<p:sld {NS}><p:cSld>{spTree}</p:cSld>'
       '<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>')

with open("unpacked/ppt/slides/slide5.xml","w",encoding="utf-8") as f:
    f.write(xml)
print("wrote slide5.xml,", len(shapes), "shapes")
