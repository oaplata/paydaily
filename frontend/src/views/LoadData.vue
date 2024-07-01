<template>
  <div>load data</div>
  <button @click="run">run</button>
</template>
<script setup>
import data from '../data_to_load/alexander.json'
import { getAllClients, createClient } from '@/api/clients';
import { updateRoute } from '@/api/routes';
import { addLoanFee, createLoan, getLoanByClientAndRoute, updateLoan } from '@/api/loans';

const run = async () => {
  const detallesRuta = data.rutaById.detallesRuta.sort((a, b) => a.index - b.index)
  const ruoteId = 'Ugb3DAfGllYht72AkMuk'
  const companyId = 'rn0tdk7uDNf0rUwuS8lY'

  await Promise.all(detallesRuta.map(detalle => {
    const clientToFirebase = {
      mapId: detalle.cliente.id,
      name: detalle.cliente.nombre,
      documentId: detalle.cliente.cedula,
      address: detalle.cliente.direccion,
      phone: detalle.cliente.telefono,
      job: detalle.cliente.trabajo,
      city: detalle.cliente.ciudad,
      state: 'active',
    }
    return createClient({ client: clientToFirebase, companyId })
  }))

  const clientsFirebase = await getAllClients({ companyId })

  const clientsIds = []

  for (const detalle of detallesRuta) {
    const firebaseClient = clientsFirebase.find(c => c.mapId === detalle.cliente.id)
    clientsIds.push(firebaseClient.id)
  }

  await updateRoute({ route: { clients: clientsIds }, companyId, id: ruoteId })

  await Promise.all(detallesRuta.map(async detalle => {
    const prestamo = detalle.prestamoDetalle[0]
    if (!prestamo) return
    const firebaseClient = clientsFirebase.find(c => c.mapId === detalle.cliente.id)
    const loan = {
      amount: prestamo.monto,
      cardNumber: prestamo.rifa,
      term: prestamo.plazoInicial,
      interest: prestamo.interes,
      feeValue: prestamo.valorCuota,
      client: firebaseClient.id,
      lender: '',
      collector: ruoteId,
      createdAt: new Date(Number(prestamo.createdAt))
    }


    console.log('crear preatmo', loan)
    const loanId = await createLoan({ loan, companyId });

    for (const cuota of prestamo.cuotas) {
      console.log('resgistrar cuota: ', cuota)

      await addLoanFee({ companyId, loanId, value: cuota.valor, createdAt: new Date(Number(cuota.createdAt)) })

      const loanFirebase = await getLoanByClientAndRoute({ companyId, clientId: firebaseClient.id, routeId: ruoteId })
      console.log({ loanFirebase })
      loanFirebase.charged = Number(loanFirebase.charged) + Number(cuota.valor)
      loanFirebase.remaining = Number(loanFirebase.remaining) - Number(cuota.valor)

      await updateLoan({ companyId, loanId, loan: {
        charged: loanFirebase.charged,
        remaining: loanFirebase.remaining,
        state: loanFirebase.remaining === 0 ? 'paid' : 'active'
      }});
    }
  }))

  console.log('Done!!!')
}
</script>
