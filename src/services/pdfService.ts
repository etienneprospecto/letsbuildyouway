import jsPDF from 'jspdf'

export interface InvoiceData {
  id: string
  invoice_number: string
  amount_total: number
  amount_paid: number
  currency: string
  status: string
  due_date: string
  created_at: string
  items: Array<{
    description: string
    quantity: number
    unit_price: number
    total: number
  }>
  notes?: string
  client: {
    first_name: string
    last_name: string
    email: string
  }
  coach: {
    name: string
    email: string
    address?: string
    phone?: string
    vat_number?: string
  }
}

export class PDFService {
  /**
   * Génère un PDF de facture
   */
  static generateInvoicePDF(invoice: InvoiceData): Blob {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Couleurs
    const primaryColor = [255, 107, 53] // Orange BYW
    const textColor = [51, 51, 51]
    const lightGray = [245, 245, 245]
    
    // Header
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 30, 'F')
    
    // Logo/Titre
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('BYW', 20, 20)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Build Your Way', 20, 28)
    
    // Numéro de facture
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`FACTURE ${invoice.invoice_number}`, pageWidth - 20, 20, { align: 'right' })
    
    // Informations coach
    doc.setTextColor(...textColor)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Émetteur:', 20, 50)
    doc.setFont('helvetica', 'bold')
    doc.text(invoice.coach.name, 20, 55)
    if (invoice.coach.email) {
      doc.setFont('helvetica', 'normal')
      doc.text(invoice.coach.email, 20, 60)
    }
    if (invoice.coach.phone) {
      doc.text(invoice.coach.phone, 20, 65)
    }
    if (invoice.coach.address) {
      doc.text(invoice.coach.address, 20, 70)
    }
    if (invoice.coach.vat_number) {
      doc.text(`TVA: ${invoice.coach.vat_number}`, 20, 75)
    }
    
    // Informations client
    doc.setFont('helvetica', 'bold')
    doc.text('Facturé à:', pageWidth - 100, 50)
    doc.text(`${invoice.client.first_name} ${invoice.client.last_name}`, pageWidth - 100, 55)
    doc.setFont('helvetica', 'normal')
    doc.text(invoice.client.email, pageWidth - 100, 60)
    
    // Détails de la facture
    doc.setFont('helvetica', 'bold')
    doc.text('Détails de la facture:', 20, 90)
    
    // Table des articles
    const tableTop = 100
    const tableLeft = 20
    const tableWidth = pageWidth - 40
    const rowHeight = 15
    
    // En-têtes du tableau
    doc.setFillColor(...lightGray)
    doc.rect(tableLeft, tableTop, tableWidth, rowHeight, 'F')
    
    doc.setTextColor(...textColor)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    
    doc.text('Description', tableLeft + 5, tableTop + 10)
    doc.text('Qté', tableLeft + 100, tableTop + 10)
    doc.text('Prix unitaire', tableLeft + 130, tableTop + 10)
    doc.text('Total', tableLeft + 170, tableTop + 10)
    
    // Lignes des articles
    let currentY = tableTop + rowHeight
    let subtotal = 0
    
    invoice.items.forEach((item, index) => {
      if (currentY > pageHeight - 50) {
        doc.addPage()
        currentY = 20
      }
      
      doc.setFont('helvetica', 'normal')
      doc.text(item.description, tableLeft + 5, currentY + 10)
      doc.text(item.quantity.toString(), tableLeft + 100, currentY + 10)
      doc.text(`${item.unit_price.toFixed(2)} ${invoice.currency}`, tableLeft + 130, currentY + 10)
      doc.text(`${item.total.toFixed(2)} ${invoice.currency}`, tableLeft + 170, currentY + 10)
      
      subtotal += item.total
      currentY += rowHeight
    })
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200)
    doc.line(tableLeft, currentY, tableLeft + tableWidth, currentY)
    currentY += 5
    
    // Total
    doc.setFont('helvetica', 'bold')
    doc.text(`Sous-total: ${subtotal.toFixed(2)} ${invoice.currency}`, tableLeft + 130, currentY + 10)
    currentY += 15
    
    const total = subtotal
    doc.setFontSize(12)
    doc.text(`TOTAL: ${total.toFixed(2)} ${invoice.currency}`, tableLeft + 130, currentY + 10)
    
    // Statut de paiement
    currentY += 20
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    if (invoice.amount_paid >= invoice.amount_total) {
      doc.setTextColor(0, 150, 0)
      doc.text('✓ PAYÉ', tableLeft + 130, currentY + 10)
    } else if (invoice.amount_paid > 0) {
      doc.setTextColor(255, 140, 0)
      doc.text(`PARTIELLEMENT PAYÉ (${invoice.amount_paid.toFixed(2)} ${invoice.currency})`, tableLeft + 130, currentY + 10)
    } else {
      doc.setTextColor(200, 0, 0)
      doc.text('EN ATTENTE DE PAIEMENT', tableLeft + 130, currentY + 10)
    }
    
    // Dates
    currentY += 20
    doc.setTextColor(...textColor)
    doc.text(`Date de facture: ${new Date(invoice.created_at).toLocaleDateString('fr-FR')}`, tableLeft, currentY + 10)
    doc.text(`Date d'échéance: ${new Date(invoice.due_date).toLocaleDateString('fr-FR')}`, tableLeft, currentY + 25)
    
    // Notes
    if (invoice.notes) {
      currentY += 40
      doc.text('Notes:', tableLeft, currentY + 10)
      doc.text(invoice.notes, tableLeft, currentY + 25)
    }
    
    // Pied de page
    const footerY = pageHeight - 20
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('Merci pour votre confiance - BYW Build Your Way', pageWidth / 2, footerY, { align: 'center' })
    
    return doc.output('blob')
  }
  
  /**
   * Télécharge un PDF de facture
   */
  static downloadInvoicePDF(invoice: InvoiceData): void {
    const pdfBlob = this.generateInvoicePDF(invoice)
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Facture_${invoice.invoice_number}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  
  /**
   * Ouvre un PDF de facture dans un nouvel onglet
   */
  static openInvoicePDF(invoice: InvoiceData): void {
    const pdfBlob = this.generateInvoicePDF(invoice)
    const url = URL.createObjectURL(pdfBlob)
    window.open(url, '_blank')
    // Nettoyer l'URL après un délai
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
